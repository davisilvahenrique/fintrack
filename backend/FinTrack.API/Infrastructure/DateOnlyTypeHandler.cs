using System.Data;
using Dapper;

namespace FinTrack.API.Infrastructure;

public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.Date;
        parameter.Value = value.ToDateTime(TimeOnly.MinValue);
    }

    public override DateOnly Parse(object value)
    {
        return value is DateOnly d ? d : DateOnly.FromDateTime((DateTime)value);
    }
}
