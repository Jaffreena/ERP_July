using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobInwardTransaction
{
    public class RNFreightInvoicePendingQty_DAO
    {
        DBConnect DB = new DBConnect();
        public DataSet RNFreightInvoicePendingQtyDB(RNFreightInvoicePendingQty_Filter_DTO filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_RNFreightInvoicePendingQty_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date,
                (object)filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date,
                (object)filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@RN_No", DbType.String,
                (object)filter.RN_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@JWC_DN_No", DbType.String,
                (object)filter.JWC_DN_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@Freight_SO_No", DbType.String,
                (object)filter.Freight_SO_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@JW_Customer_Number", DbType.Int64,
                (object)filter.JW_Customer_Number ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
    }
}