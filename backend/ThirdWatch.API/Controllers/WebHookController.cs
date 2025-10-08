using System.Net;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ThirdWatch.API.Models.Requests.WebHook;
using ThirdWatch.Application.DTOs.Webhooks;
using ThirdWatch.Application.Handlers.Commands.Webhooks;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/hooks")]
[Produces(MediaTypeNames.Application.Json)]
public class WebHookController(IMediator mediator) : ControllerBase
{
    [HttpPost("create")]
    [ProducesResponseType(typeof(ApiResponse<Uri>), (int)HttpStatusCode.Created)]
    public async Task<IActionResult> Create([FromBody] CreateWebHookEndpointRequest request)
    {
        var command = new CreateWebhookEndpointCommand(request.ProviderName, User.GetUserId());

        var result = await mediator.Send(command);

        return CreatedAtAction(nameof(Create), ApiResponse<Uri>.SuccessResult(result));
    }


    [AllowAnonymous]
    [HttpPost("endpointId/{endpointId}")]
    [EnableRateLimiting("WebhookRateLimit")]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.TooManyRequests)]
    public async Task<IActionResult> Receive(Guid endpointId)
    {
        using var reader = new StreamReader(Request.Body);
        string payload = await reader.ReadToEndAsync();

        string? sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var headers = Request.Headers
            .ToDictionary(h => h.Key, h => h.Value.ToString());

        var command = new WebhookRequestReceivedCommand(sourceIp, endpointId, payload, JsonSerializer.Serialize(headers));
        await mediator.Send(command);

        return Ok(ApiResponse.SuccessResult("Received"));
    }

    [HttpGet("histories")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<WebhookHistoriesDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetHistories()
    {
        var query = new GetWebhookHistoriesQuery(User.GetUserId());
        var result = await mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<WebhookHistoriesDto>>.SuccessResult(result));
    }

    [HttpGet("active-endpoint")]
    [ProducesResponseType(typeof(ApiResponse<Uri?>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetActiveEndpoint()
    {
        var query = new GetActiveWebhookEndpointQuery(User.GetUserId());
        var result = await mediator.Send(query);
        return Ok(ApiResponse<Uri?>.SuccessResult(result));
    }


    [HttpGet("endpoint-id/{endpointId}/history-id/{historyId}/payload")]
    [ProducesResponseType(typeof(ApiResponse<WebhookHistoryDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDetails(Guid endpointId, Guid historyId)
    {
        var result = await mediator.Send(new WebhookQueries(endpointId, historyId));
        return Ok(ApiResponse<WebhookHistoryDto>.SuccessResult(result));
    }

    [HttpDelete("histories")]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> DeleteHistories()
    {
        var command = new DeleteWebhookHistoriesCommand(User.GetUserId());
        await mediator.Send(command);
        return Ok(ApiResponse.SuccessResult("Deleted"));
    }
}
