using System.Security.Claims;
using FieldVisits.API.Exceptions;
using FieldVisits.API.Models.Enums;

namespace FieldVisits.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(value, out var userId))
        {
            throw new UnauthorizedException("Kullanıcı kimliği okunamadı.");
        }

        return userId;
    }

    public static Role GetRole(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.Role);
        if (!Enum.TryParse<Role>(value, out var role))
        {
            throw new UnauthorizedException("Kullanıcı rolü okunamadı.");
        }

        return role;
    }
}
