using System.Text.Json.Serialization;

namespace ThirdWatch.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HttpMethodType
{
    Post,
    Get,
}
