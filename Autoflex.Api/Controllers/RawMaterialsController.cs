using Autoflex.Api.Data;
using Autoflex.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoflex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RawMaterialsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RawMaterialsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RawMaterial>>> GetAll()
        => await _db.RawMaterials.ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RawMaterial>> GetById(Guid id)
    {
        var rm = await _db.RawMaterials.FindAsync(id);
        return rm is null ? NotFound() : Ok(rm);
    }

    [HttpPost]
    public async Task<ActionResult<RawMaterial>> Create(RawMaterial rm)
    {
        rm.Id = Guid.NewGuid();
        _db.RawMaterials.Add(rm);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = rm.Id }, rm);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, RawMaterial input)
    {
        var rm = await _db.RawMaterials.FindAsync(id);
        if (rm is null) return NotFound();

        rm.Code = input.Code;
        rm.Name = input.Name;
        rm.StockQuantity = input.StockQuantity;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var rm = await _db.RawMaterials.FindAsync(id);
        if (rm is null) return NotFound();

        _db.RawMaterials.Remove(rm);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
