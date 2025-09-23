using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThirdWatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RefactorTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_WebhookRequestLogs_WebhookProcessingStatus_Enum",
                table: "WebhookRequestLogs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "WebhookRequestLogs");

            migrationBuilder.DropColumn(
                name: "ResponseStatusCode",
                table: "WebhookRequestLogs");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WebhookRequestLogs");

            migrationBuilder.DropColumn(
                name: "WebhookProcessingStatus",
                table: "WebhookRequestLogs");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "WebhookRequestLogs",
                newName: "ReceivedAt");

            migrationBuilder.RenameColumn(
                name: "BodyBlobUrl",
                table: "WebhookRequestLogs",
                newName: "PayloadBlobUrl");

            migrationBuilder.AddColumn<int>(
                name: "ResponseStatusCode",
                table: "WebhookEndpoints",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResponseStatusCode",
                table: "WebhookEndpoints");

            migrationBuilder.RenameColumn(
                name: "ReceivedAt",
                table: "WebhookRequestLogs",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "PayloadBlobUrl",
                table: "WebhookRequestLogs",
                newName: "BodyBlobUrl");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "WebhookRequestLogs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ResponseStatusCode",
                table: "WebhookRequestLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedAt",
                table: "WebhookRequestLogs",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebhookProcessingStatus",
                table: "WebhookRequestLogs",
                type: "nvarchar(9)",
                maxLength: 9,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "CK_WebhookRequestLogs_WebhookProcessingStatus_Enum",
                table: "WebhookRequestLogs",
                sql: "[WebhookProcessingStatus] IN (N'Pending', N'Completed')");
        }
    }
}
