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
    public class ItemTrackerGeneral_DAO
    {
        DBConnect DB = new DBConnect();

        // Filter dropdowns
        public DataSet GetItemGroupList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetSqlStringCommand("SELECT ItemGroupNumber, ItemGroup FROM ItemGroup ORDER BY ItemGroup");
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetItemList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetSqlStringCommand("SELECT ItemNumber, ItemCode FROM Item ORDER BY ItemCode");
            return db.ExecuteDataSet(cmd);
        }

        public DataSet GetCustomerList()
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetSqlStringCommand("SELECT CUS_Number, CUS_Name FROM JW_Customer ORDER BY CUS_Name");
            return db.ExecuteDataSet(cmd);
        }

        // Report data - Item Tracker General (mother rows only)
        public DataSet GetItemTrackerGeneralDB(ItemTrackByDCFilter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_ItemTrackerGeneral_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date, (object)Filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date, (object)Filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@DCNo", DbType.String,
                string.IsNullOrWhiteSpace(Filter.DCNo) ? (object)DBNull.Value : Filter.DCNo.Trim());
            db.AddInParameter(cmd, "@CustomerNumber", DbType.Int64, (object)Filter.CustomerNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemGroupNumber", DbType.Int32, (object)Filter.ItemGroupNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemNumber", DbType.Int32, (object)Filter.ItemNumber ?? DBNull.Value);
            db.AddInParameter(cmd, "@BatchNo", DbType.String,
                string.IsNullOrWhiteSpace(Filter.BatchNo) ? (object)DBNull.Value : Filter.BatchNo.Trim());

            return db.ExecuteDataSet(cmd);
        }
    }
}