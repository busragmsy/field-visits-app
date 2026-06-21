using FieldVisits.API.Models.DTOs;

namespace FieldVisits.API.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
