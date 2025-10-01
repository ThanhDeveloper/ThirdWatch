using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThirdWatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWebhookTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_WebhookEndpoints_HttpMethod_Enum",
                table: "WebhookEndpoints");

            migrationBuilder.DropColumn(
                name: "HttpMethod",
                table: "WebhookEndpoints");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CreatedAt",
                table: "WebhookHistories",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "WebhookHistories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "UpdatedAt",
                table: "WebhookHistories",
                type: "datetimeoffset",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "WebhookHistories");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "WebhookHistories");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WebhookHistories");

            migrationBuilder.AddColumn<string>(
                name: "HttpMethod",
                table: "WebhookEndpoints",
                type: "nvarchar(4)",
                maxLength: 4,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddCheckConstraint(
                name: "CK_WebhookEndpoints_HttpMethod_Enum",
                table: "WebhookEndpoints",
                sql: "[HttpMethod] IN (N'Post', N'Get')");
        }
    }
}
