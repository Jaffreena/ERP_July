using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobInwardTransaction
{
    public class DNFreightInvoicePendingQty_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet DNFreightInvoicePendingQtyDB(DNFreightInvoicePendingQty_Filter_DTO filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_DNFreightInvoicePendingQty_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date, (object)filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date, (object)filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@DN_No", DbType.String, (object)filter.DN_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@Freight_SO_No", DbType.String, (object)filter.Freight_SO_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@JW_Customer_Number", DbType.Int64, (object)filter.JW_Customer_Number ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
    }
}