namespace Autoflex.Api.Models;

public class ProductRawMaterial
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid RawMaterialId { get; set; }
    public RawMaterial RawMaterial { get; set; } = null!;

    public int QuantityRequired { get; set; }
}
