using System.Text.Json;
using FieldVisits.API.Exceptions;

namespace FieldVisits.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = ex switch
            {
                NotFoundException => StatusCodes.Status404NotFound,
                _ => StatusCodes.Status400BadRequest,
            };
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new { error = ex.Message });
            await context.Response.WriteAsync(response);
        }
    }
}
