using Autoflex.Api.Data;
using Autoflex.Api.Dtos;
using Autoflex.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoflex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Product>>> GetAll()
        => await _db.Products
            .Include(p => p.Materials)
            .ThenInclude(pm => pm.RawMaterial)
            .ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Product>> GetById(Guid id)
    {
        var product = await _db.Products
            .Include(p => p.Materials)
            .ThenInclude(pm => pm.RawMaterial)
            .FirstOrDefaultAsync(p => p.Id == id);

        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(Product product)
    {
        product.Id = Guid.NewGuid();
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Product input)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.Code = input.Code;
        product.Name = input.Name;
        product.Price = input.Price;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // RF003 - Association CRUD

    [HttpPost("{id:guid}/materials")]
    public async Task<IActionResult> AddMaterial(Guid id, AddProductMaterialRequest request)
    {
        if (request.QuantityRequired <= 0)
            return BadRequest("QuantityRequired must be greater than 0.");

        var productExists = await _db.Products.AnyAsync(p => p.Id == id);
        if (!productExists) return NotFound("Product not found.");

        var rawMaterial = await _db.RawMaterials.FindAsync(request.RawMaterialId);
        if (rawMaterial is null) return NotFound("RawMaterial not found.");

        var alreadyExists = await _db.ProductRawMaterials
            .AnyAsync(x => x.ProductId == id && x.RawMaterialId == request.RawMaterialId);

        if (alreadyExists) return Conflict("This raw material is already associated to the product.");

        _db.ProductRawMaterials.Add(new ProductRawMaterial
        {
            ProductId = id,
            RawMaterialId = request.RawMaterialId,
            QuantityRequired = request.QuantityRequired
        });

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/materials/{rawMaterialId:guid}")]
    public async Task<IActionResult> UpdateMaterial(Guid id, Guid rawMaterialId, AddProductMaterialRequest request)
    {
        if (request.QuantityRequired <= 0)
            return BadRequest("QuantityRequired must be greater than 0.");

        var link = await _db.ProductRawMaterials
            .FirstOrDefaultAsync(x => x.ProductId == id && x.RawMaterialId == rawMaterialId);

        if (link is null) return NotFound("Association not found.");

        link.QuantityRequired = request.QuantityRequired;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:guid}/materials/{rawMaterialId:guid}")]
    public async Task<IActionResult> RemoveMaterial(Guid id, Guid rawMaterialId)
    {
        var link = await _db.ProductRawMaterials
            .FirstOrDefaultAsync(x => x.ProductId == id && x.RawMaterialId == rawMaterialId);

        if (link is null) return NotFound("Association not found.");

        _db.ProductRawMaterials.Remove(link);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
