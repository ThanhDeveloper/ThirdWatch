namespace ThirdWatch.Shared.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public IReadOnlyCollection<string> Errors { get; set; } = [];
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

#pragma warning disable CA1000 // Do not declare static members on generic types
    public static ApiResponse<T> SuccessResult(T data)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data
        };
    }

    public static ApiResponse ErrorResult(string message, IReadOnlyCollection<string>? errors = null)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Errors = errors ?? []
        };
    }
}

public class ApiResponse : ApiResponse<object>
{
    public static new ApiResponse ErrorResult(string message, IReadOnlyCollection<string>? errors = null)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Errors = errors ?? []
        };
    }
#pragma warning restore CA1000 // Do not declare static members on generic types

}
