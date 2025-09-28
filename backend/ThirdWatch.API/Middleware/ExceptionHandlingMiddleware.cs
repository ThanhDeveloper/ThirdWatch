using System.Net;
using System.Net.Mime;
using ThirdWatch.Application.Exceptions;
using ThirdWatch.Domain.Exceptions;

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
#pragma warning disable CA1031
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
#pragma warning restore CA1031
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = MediaTypeNames.Application.Json;

        var response = exception switch
        {
            ArgumentException => ApiResponse.ErrorResult("Invalid argument provided", [exception.Message]),
            InvalidOperationException => ApiResponse.ErrorResult("Invalid operation", [exception.Message]),
            InvalidDataException => ApiResponse.ErrorResult("Invalid data provided", [exception.Message]),
            DomainException => ApiResponse.ErrorResult("Domain exception", [exception.Message]),
            BusinessException => ApiResponse.ErrorResult("Business rule violation", [exception.Message]),
            NotFoundException => ApiResponse.ErrorResult("Data not found", [exception.Message]),
            _ => ApiResponse.ErrorResult("An unexpected error occurred", ["Internal server error"])
        };

        context.Response.StatusCode = exception switch
        {
            ArgumentException => (int)HttpStatusCode.BadRequest,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            InvalidDataException => (int)HttpStatusCode.BadRequest,
            DomainException => (int)HttpStatusCode.BadRequest,
            BusinessException => (int)HttpStatusCode.BadRequest,
            NotFoundException => (int)HttpStatusCode.NotFound,
            _ => (int)HttpStatusCode.InternalServerError
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
    }
}
