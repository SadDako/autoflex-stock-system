namespace Autoflex.Api.Dtos;

public class ProductionSuggestionItem
{
    public Guid ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }
    public int QuantityToProduce { get; set; }

    public decimal TotalValue => UnitPrice * QuantityToProduce;
}
