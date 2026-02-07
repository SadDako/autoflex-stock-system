using Autoflex.Api.Data;
using Autoflex.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoflex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductionController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductionController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<ProductionSuggestionResponse>> GetSuggestion()
    {
        var products = await _db.Products
            .Include(p => p.Materials)
            .ThenInclude(pm => pm.RawMaterial)
            .OrderByDescending(p => p.Price)
            .ToListAsync();

        var stock = await _db.RawMaterials
            .ToDictionaryAsync(rm => rm.Id, rm => rm.StockQuantity);

        var response = new ProductionSuggestionResponse();

        foreach (var product in products)
        {
            if (product.Materials.Count == 0) continue;

            int maxPossible = int.MaxValue;

            foreach (var m in product.Materials)
            {
                if (m.QuantityRequired <= 0) { maxPossible = 0; break; }

                var available = stock.TryGetValue(m.RawMaterialId, out var qty) ? qty : 0;
                var possible = available / m.QuantityRequired;

                if (possible < maxPossible)
                    maxPossible = possible;
            }

            if (maxPossible <= 0) continue;

            foreach (var m in product.Materials)
                stock[m.RawMaterialId] -= maxPossible * m.QuantityRequired;

            response.Items.Add(new ProductionSuggestionItem
            {
                ProductId = product.Id,
                ProductCode = product.Code,
                ProductName = product.Name,
                UnitPrice = product.Price,
                QuantityToProduce = maxPossible
            });
        }

        return Ok(response);
    }
}
