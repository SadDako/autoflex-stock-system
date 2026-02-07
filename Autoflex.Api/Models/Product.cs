namespace Autoflex.Api.Models;

public class Product
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public List<ProductRawMaterial> Materials { get; set; } = new();
}
