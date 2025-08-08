using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ThirdWatch.API.Controllers;
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ValuesController : ControllerBase
{
    [HttpGet("test/{expectedCode}")]
    public IActionResult GetTest(int expectedCode)
    {
        return expectedCode switch
        {
            200 => Ok("This is a test endpoint."),
            400 => throw new InvalidDataException(),
            401 => throw new UnauthorizedAccessException("You are not authorized to access this resource."),
            404 => NotFound("Resource not found."),
            _ => throw new InvalidCastException(),// This will trigger the global exception handler
        };
    }
}
