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
                UnauthorizedException => StatusCodes.Status401Unauthorized,
                ForbiddenException => StatusCodes.Status403Forbidden,
                NotFoundException => StatusCodes.Status404NotFound,
                ConflictException => StatusCodes.Status409Conflict,
                ValidationException => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status400BadRequest,
            };
            context.Response.ContentType = "application/json";

            var response = JsonSerializer.Serialize(new
            {
                error = ex.Message,
                status = context.Response.StatusCode
            });
            await context.Response.WriteAsync(response);
        }
    }
}
