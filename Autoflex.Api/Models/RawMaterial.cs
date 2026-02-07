namespace Autoflex.Api.Models;

public class RawMaterial
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int StockQuantity { get; set; }

    public List<ProductRawMaterial> Products { get; set; } = new();
}
