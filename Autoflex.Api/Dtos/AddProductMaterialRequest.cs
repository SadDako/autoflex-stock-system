namespace Autoflex.Api.Dtos;

public class AddProductMaterialRequest
{
    public Guid RawMaterialId { get; set; }
    public int QuantityRequired { get; set; }
}
