using FieldVisits.API.Models.Entities;

namespace FieldVisits.API.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateToken(User user);
}
