using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FieldVisits.API.Migrations
{
    /// <inheritdoc />
    public partial class PreventDuplicateVisits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Visits_UserId",
                table: "Visits");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_UserId_CustomerName_VisitDate",
                table: "Visits",
                columns: new[] { "UserId", "CustomerName", "VisitDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Visits_UserId_CustomerName_VisitDate",
                table: "Visits");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_UserId",
                table: "Visits",
                column: "UserId");
        }
    }
}
