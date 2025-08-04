namespace ThirdWatch.Application.Exceptions;

public class BusinessException : Exception
{
    public string ErrorCode { get; }

    public BusinessException(string message) : base(message)
    {
        ErrorCode = "BUSINESS_ERROR";
    }

    public BusinessException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }

    public BusinessException(string message, Exception innerException) : base(message, innerException)
    {
        ErrorCode = "BUSINESS_ERROR";
    }
}
