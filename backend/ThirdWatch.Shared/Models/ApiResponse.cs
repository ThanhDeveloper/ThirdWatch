namespace ThirdWatch.Shared.Models;

public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IReadOnlyCollection<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse ErrorResult(string message, IReadOnlyCollection<string>? errors = null)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Errors = errors ?? []
        };
    }

    public static ApiResponse SuccessResult(string message = "", IReadOnlyCollection<string>? additionalInfo = null)
    {
        return new ApiResponse
        {
            Success = true,
            Message = message,
            Errors = additionalInfo
        };
    }
}

public class ApiResponse<T> : ApiResponse
{
    public T? Data { get; set; }

#pragma warning disable CA1000 // Do not declare static members on generic types
    public static ApiResponse<T> SuccessResult(T data, string message = "")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            Errors = []
        };
    }

    public static new ApiResponse<T> ErrorResult(string message, IReadOnlyCollection<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? []
        };
    }
#pragma warning restore CA1000 // Do not declare static members on generic types
}
