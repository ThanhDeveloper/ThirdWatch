using System.Net;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ThirdWatch.API.Models.Requests.WebHook;
using ThirdWatch.Application.DTOs.WebHooks;
using ThirdWatch.Application.Handlers.Commands.WebHooks;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.API.Controllers;

//[Authorize]
[ApiController]
[Route("api/hooks")]
[Produces(MediaTypeNames.Application.Json)]
public class WebHookController(IMediator mediator) : ControllerBase
{
    [HttpPost("create")]
    [ProducesResponseType(typeof(ApiResponse<Uri>), (int)HttpStatusCode.Created)]
    public async Task<IActionResult> Create([FromBody] CreateWebHookEndpointRequest request)
    {
        var command = new CreateWebHookEndpointCommand(request.ProviderName, request.HttpMethod, User.GetUserId());

        var result = await mediator.Send(command);

        return CreatedAtAction(nameof(Create), ApiResponse<Uri>.SuccessResult(result));
    }


    [AllowAnonymous]
    [HttpPost]
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

        var command = new WebHookRequestReceivedCommand(sourceIp, endpointId, payload, JsonSerializer.Serialize(headers));
        await mediator.Send(command);

        return Ok(ApiResponse.SuccessResult("Received"));
    }

    [HttpGet]
    [HttpGet("histories")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<WebHookHistoriesDto>>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetHistories()
    {
        var query = new GetWebHookRequestHistoriesQuery(User.GetUserId());
        var result = await mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<WebHookHistoriesDto>>.SuccessResult(result));
    }

    [HttpGet("active-endpoint")]
    [ProducesResponseType(typeof(ApiResponse<Uri?>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetActiveEndpoint()
    {
        var query = new GetActiveWebHookEndpointQuery(User.GetUserId());
        var result = await mediator.Send(query);
        return Ok(ApiResponse<Uri?>.SuccessResult(result));
    }


    [HttpGet("endpoint-id/{endpointId}/history-id/{historyId}/payload")]
    [ProducesResponseType(typeof(ApiResponse<WebHookHistoryDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDetails(Guid endpointId, Guid historyId)
    {
        var result = await mediator.Send(new WebHookQueries(endpointId, historyId));
        return Ok(ApiResponse<WebHookHistoryDto>.SuccessResult(result));
    }
}
