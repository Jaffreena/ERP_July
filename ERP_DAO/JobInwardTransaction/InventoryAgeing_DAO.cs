using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobInwardTransaction
{
    public class InventoryAgeing_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet GetInventoryAgeingDB(InventoryAgeingFilter_DTO Filter, string BatchNumber = null)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_InventoryAgeing_SP");

            db.AddInParameter(cmd, "@ClosingDate", DbType.Date, (object)Filter.ClosingDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemGroupNumber", DbType.Int64, (object)Filter.ItemGroupNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@WarehouseNumber", DbType.Int64, (object)Filter.WarehouseNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemNumber", DbType.Int64, (object)Filter.ItemNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@BatchNumber", DbType.String,
                string.IsNullOrWhiteSpace(BatchNumber) ? (object)DBNull.Value : BatchNumber.Trim());

            return db.ExecuteDataSet(cmd);
        }
    }
}