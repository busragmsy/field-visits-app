using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FieldVisits.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Visits",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Visits");
        }
    }
}
