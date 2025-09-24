using System.Net;
using System.Net.Mime;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ThirdWatch.API.Models.Requests.WebHook;
using ThirdWatch.Application.DTOs.WebHooks;
using ThirdWatch.Application.Handlers.Commands.WebHooks;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/hooks")]
[Produces(MediaTypeNames.Application.Json)]
public class WebHookController(IMediator mediator) : ControllerBase
{
    [HttpPost("create")]
    [ProducesResponseType(typeof(ApiResponse<WebHookCreatedDto>), (int)HttpStatusCode.Created)]
    public async Task<IActionResult> Create([FromBody] CreateWebHookEndpointRequest request)
    {
        var command = new CreateWebHookCommand(request.ProviderName, User.GetUserId());

        var result = await mediator.Send(command);

        return CreatedAtAction(nameof(Create), ApiResponse<WebHookCreatedDto>.SuccessResult(result));
    }


    [AllowAnonymous]
    [HttpPost]
    [EnableRateLimiting("WebhookRateLimit")]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.TooManyRequests)]
#pragma warning disable IDE0060 // Remove unused parameter
    public async Task<IActionResult> Receive(Guid endpointId)
#pragma warning restore IDE0060 // Remove unused parameter
    {
        using var reader = new StreamReader(Request.Body);
        string payload = await reader.ReadToEndAsync();

        string? sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var headers = Request.Headers
            .ToDictionary(h => h.Key, h => h.Value.ToString());

        var command = new WebHookReceivedCommand(sourceIp, endpointId, payload, JsonSerializer.Serialize(headers));
        await mediator.Send(command);

        return Ok(ApiResponse.SuccessResult("Received"));
    }
}
