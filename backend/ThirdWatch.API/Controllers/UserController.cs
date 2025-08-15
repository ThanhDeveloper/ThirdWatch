using System.Net;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThirdWatch.Application.DTOs.Users;
using ThirdWatch.Application.Handlers.Queries.User;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.API.Controllers;

[ApiController]
[Route("api/user")]
[Produces(MediaTypeNames.Application.Json)]
[Authorize]
public class UserController(IMediator mediator) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await mediator.Send(new GetCurrentUserQuery { UserId = User.GetUserId() });

        return Ok(ApiResponse<UserResponseDto>.SuccessResult(user));
    }
}
