using ThirdWatch.API.Extensions;
using ThirdWatch.API.Filters;
using ThirdWatch.API.Middleware;
using ThirdWatch.Infrastructure.Services;
using ThirdWatch.Shared.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddInfrastructureServices();
builder.Services.AddSwaggerServices();

builder.Services.AddControllers(options => options.Filters.Add<ValidateModelFilter>())
                .ConfigureApiBehaviorOptions(options => options.SuppressModelStateInvalidFilter = true);
builder.Services.AddEndpointsApiExplorer();

//add option config
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.Section));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ThirdWatchPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ThirdWatch API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Global exception handling 
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("ThirdWatchPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

if (builder.Configuration.GetValue<bool>("ApplyMigrationsOnStartup"))
{
    await DatabaseService.ApplyMigrationsAsync(app.Services);
}

await app.RunAsync();
