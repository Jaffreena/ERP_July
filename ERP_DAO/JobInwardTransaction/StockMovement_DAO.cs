using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobInwardTransaction
{
    public class StockMovement_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet GetItemGroupList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetSqlStringCommand("SELECT ItemGroupNumber, ItemGroup FROM ItemGroup ORDER BY ItemGroup");
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetWarehouseList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetSqlStringCommand("SELECT WarehouseNumber, WarehouseCode FROM Warehouse ORDER BY WarehouseCode");
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetItemList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetSqlStringCommand("SELECT ItemNumber, ItemCode FROM Item ORDER BY ItemCode");
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetStockMovementDB(StockMovementFilter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_StockMovement_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date, (object)Filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date, (object)Filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemGroupNumber", DbType.Int64, (object)Filter.ItemGroupNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@WarehouseNumber", DbType.Int64, (object)Filter.WarehouseNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemNumber", DbType.Int64, (object)Filter.ItemNumber ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetStockMovementDetailDB(StockMovementFilter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_StockMovementDetail_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date, (object)Filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date, (object)Filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemGroupNumber", DbType.Int64, (object)Filter.ItemGroupNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@WarehouseNumber", DbType.Int64, (object)Filter.WarehouseNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemNumber", DbType.Int64, (object)Filter.ItemNumber ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
    }
}
