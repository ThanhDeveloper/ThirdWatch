using System.Net;
using System.Text.Json;

namespace ThirdWatch.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
#pragma warning disable CA1031 // Do not catch general exception types
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
#pragma warning restore CA1031 // Do not catch general exception types
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            UnauthorizedAccessException => new ApiResponse
            {
                Success = false,
                Message = exception.Message,
                Errors = ["Authentication failed"]
            },
            ArgumentException => new ApiResponse
            {
                Success = false,
                Message = "Invalid argument provided",
                Errors = [exception.Message]
            },
            InvalidOperationException => new ApiResponse
            {
                Success = false,
                Message = "Invalid operation",
                Errors = [exception.Message]
            },
            _ => new ApiResponse
            {
                Success = false,
                Message = "An unexpected error occurred",
                Errors = ["Internal server error"]
            }
        };

        context.Response.StatusCode = exception switch
        {
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }
}
