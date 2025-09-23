using System.Net;
using System.Net.Mime;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> Receive(Guid endpointId)
    {
        using var reader = new StreamReader(Request.Body);
        string payload = await reader.ReadToEndAsync();

        var headers = Request.Headers
            .ToDictionary(h => h.Key, h => h.Value.ToString());

        var command = new WebHookReceivedCommand(endpointId, payload, JsonSerializer.Serialize(headers));
        await mediator.Send(command);

        return Ok(ApiResponse.SuccessResult("Received"));
    }
}
