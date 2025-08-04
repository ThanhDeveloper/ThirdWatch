using MediatR;
using Microsoft.AspNetCore.Mvc;
using ThirdWatch.API.Models.Requests.Auth;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Shared.Models;

namespace ThirdWatch.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 401)]
    [ProducesResponseType(typeof(ApiResponse), 500)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse.ErrorResult("Invalid request data", errors));
        }

        try
        {
            _logger.LogInformation("Login attempt for username: {Username}", request.Username);

            var command = new LoginCommand(request.Username, request.Password);

            var result = await _mediator.Send(command);

            return Ok(ApiResponse<LoginResponseDto>.SuccessResult(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError("Login failed for username: {Username}. Reason: {Message}", request.Username, ex.Message);

            return Unauthorized();
        }
    }
}
