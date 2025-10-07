using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThirdWatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExpirationTimeForWebhookEndpoint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResponseStatusCode",
                table: "WebhookEndpoints");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ExpirationTime",
                table: "WebhookEndpoints",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpirationTime",
                table: "WebhookEndpoints");

            migrationBuilder.AddColumn<int>(
                name: "ResponseStatusCode",
                table: "WebhookEndpoints",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
