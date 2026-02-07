namespace Autoflex.Api.Dtos;

public class ProductionSuggestionResponse
{
    public List<ProductionSuggestionItem> Items { get; set; } = new();
    public decimal GrandTotalValue => Items.Sum(i => i.TotalValue);
}
