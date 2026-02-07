using Microsoft.EntityFrameworkCore;
using Autoflex.Api.Models;

namespace Autoflex.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }

    public DbSet<RawMaterial> RawMaterials { get; set; }

    public DbSet<ProductRawMaterial> ProductRawMaterials { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProductRawMaterial>()
            .HasKey(x => new { x.ProductId, x.RawMaterialId });
    }
}
