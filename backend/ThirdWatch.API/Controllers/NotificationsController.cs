using System.Net;
using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThirdWatch.Application.DTOs.Notifications;
using ThirdWatch.Shared.Extensions;

namespace ThirdWatch.API.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
[Produces(MediaTypeNames.Application.Json)]
public class NotificationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<NotificationDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetNotifications()
    {
        var query = new GetNotificationsQuery(User.GetUserId());
        var result = await mediator.Send(query);
        return Ok(ApiResponse<IReadOnlyList<NotificationDto>>.SuccessResult(result));
    }

    [HttpPatch("{notificationId:guid}/mark-as-read")]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> MarkAsRead(Guid notificationId)
    {
        var command = new MarkNotificationAsReadCommand(User.GetUserId(), notificationId);
        await mediator.Send(command);
        return NoContent();
    }

    [HttpPatch("mark-all-as-read")]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var command = new MarkAllNotificationsAsReadCommand(User.GetUserId());
        await mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{notificationId:guid}")]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    [ProducesResponseType(typeof(ApiResponse), (int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteNotification(Guid notificationId)
    {
        var command = new DeleteNotificationCommand(User.GetUserId(), notificationId);
        await mediator.Send(command);
        return NoContent();
    }
}
