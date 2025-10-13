using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThirdWatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SiteName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Url = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PreferredIntervalMinutes = table.Column<int>(type: "int", nullable: false),
                    LastCheckedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UptimePercentage = table.Column<decimal>(type: "decimal(18,5)", nullable: false),
                    StabilityPercentage = table.Column<decimal>(type: "decimal(18,5)", nullable: false),
                    CurrentResponseTimeMs = table.Column<int>(type: "int", nullable: false),
                    P50ms = table.Column<int>(type: "int", nullable: false),
                    P90ms = table.Column<int>(type: "int", nullable: false),
                    P95ms = table.Column<int>(type: "int", nullable: false),
                    P99ms = table.Column<int>(type: "int", nullable: false),
                    IsSslValid = table.Column<bool>(type: "bit", nullable: false),
                    SslExpiresInDays = table.Column<int>(type: "int", nullable: false),
                    ResponseTrendData = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    LastStatus = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    HealthStatus = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sites", x => x.Id);
                    table.CheckConstraint("CK_Sites_HealthStatus_Enum", "[HealthStatus] IN (N'Healthy', N'Warning', N'Critical')");
                    table.CheckConstraint("CK_Sites_LastStatus_Enum", "[LastStatus] IN (N'Up', N'Down', N'Error')");
                    table.ForeignKey(
                        name: "FK_Sites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sites_UserId",
                table: "Sites",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sites");
        }
    }
}
