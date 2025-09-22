using System.Net;
using System.Net.Mime;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using ThirdWatch.Application.DTOs.WebHooks;
using ThirdWatch.Application.Handlers.Commands.WebHooks;

namespace ThirdWatch.API.Controllers;

[ApiController]
[Route("api/hooks")]
[Produces(MediaTypeNames.Application.Json)]
public class WebHookController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WebHookReceiveDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> Receive(Guid endpointId)
    {
        using var reader = new StreamReader(Request.Body);
        string payload = await reader.ReadToEndAsync();

        var headers = Request.Headers
            .ToDictionary(h => h.Key, h => h.Value.ToString());

        var command = new WebHookReceiveCommand(endpointId, payload, JsonSerializer.Serialize(headers));
        var result = await mediator.Send(command);

        return Ok(ApiResponse<WebHookReceiveDto>.SuccessResult(result));
    }
}
