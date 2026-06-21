using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FieldVisits.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Visits",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Visits",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Visits");
        }
    }
}
