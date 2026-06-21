namespace FieldVisits.API.Exceptions;

/// <summary>
/// Aranan kaydın bulunamadığı durumlarda fırlatılır; middleware tarafından
/// 404 Not Found olarak yanıtlanır.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
