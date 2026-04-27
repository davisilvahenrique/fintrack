FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["FinTrack.API/FinTrack.API.csproj", "FinTrack.API/"]
RUN dotnet restore "FinTrack.API/FinTrack.API.csproj"
COPY . .
WORKDIR "/src/FinTrack.API"
RUN dotnet publish "FinTrack.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinTrack.API.dll"]
