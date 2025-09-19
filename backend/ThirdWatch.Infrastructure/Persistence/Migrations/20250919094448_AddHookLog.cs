using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThirdWatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHookLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HookLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EndpointId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HookLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HookLogDetails",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Headers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HookLogId1 = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    HookLogId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HookLogDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HookLogDetails_HookLogs_HookLogId",
                        column: x => x.HookLogId,
                        principalTable: "HookLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HookLogDetails_HookLogs_HookLogId1",
                        column: x => x.HookLogId1,
                        principalTable: "HookLogs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_HookLogDetails_HookLogId",
                table: "HookLogDetails",
                column: "HookLogId");

            migrationBuilder.CreateIndex(
                name: "IX_HookLogDetails_HookLogId1",
                table: "HookLogDetails",
                column: "HookLogId1");

            migrationBuilder.CreateIndex(
                name: "IX_HookLogs_EndpointId",
                table: "HookLogs",
                column: "EndpointId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HookLogDetails");

            migrationBuilder.DropTable(
                name: "HookLogs");
        }
    }
}
