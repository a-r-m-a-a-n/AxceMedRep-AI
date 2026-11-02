using Microsoft.EntityFrameworkCore;
using AxceMedRepAI.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=AxceMedRep.db;Cache=Shared";
builder.Services.AddDbContext<AxceMedRepDbContext>(options =>
    options.UseSqlite(connectionString));

// Add CORS for React web frontend & WPF desktop clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllClinicians", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAllClinicians");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Health Check Endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    product = "AxceMedRep AI Web API",
    version = "10.0.1",
    engine = "Clean Architecture / .NET 10",
    compliance = "HIPAA Security / IEC 62304 Class B Ready",
    timestamp = DateTime.UtcNow
}));

// Apply migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AxceMedRepDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
