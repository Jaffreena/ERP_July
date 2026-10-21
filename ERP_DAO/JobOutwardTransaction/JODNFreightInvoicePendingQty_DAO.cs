using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JODNFreightInvoicePendingQty_DAO
    {
        DBConnect DB = new DBConnect();

        #region JO DN Freight Invoice Pending Qty (Report 5.2)

        public DataSet JODNFreightInvoicePendingQtyDB(JODNFreightInvoicePendingQty_Filter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_DNFreightInvoicePendingQty_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date,
                Filter.FromDate.HasValue ? (object)Filter.FromDate.Value : DBNull.Value);

            db.AddInParameter(cmd, "@ToDate", DbType.Date,
                Filter.ToDate.HasValue ? (object)Filter.ToDate.Value : DBNull.Value);

            db.AddInParameter(cmd, "@DN_No", DbType.String,
                string.IsNullOrEmpty(Filter.DN_No) ? (object)DBNull.Value : Filter.DN_No);

            db.AddInParameter(cmd, "@Freight_SO_No", DbType.String,
                string.IsNullOrEmpty(Filter.Freight_SO_No) ? (object)DBNull.Value : Filter.Freight_SO_No);

            db.AddInParameter(cmd, "@JW_Vendor_Number", DbType.Int64,
                Filter.JW_Vendor_Number.HasValue ? (object)Filter.JW_Vendor_Number.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
    }
}