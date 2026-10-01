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
    public class JWInvoicePendingQty_DAO
    {
        DBConnect DB = new DBConnect();

        #region JW Invoice Pending Qty (Report 5.1)

        public DataSet JWInvoicePendingQtyDB(JWInvoicePendingQty_Filter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_JWInvoicePendingQty_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date,
                Filter.FromDate.HasValue ? (object)Filter.FromDate.Value : DBNull.Value);

            db.AddInParameter(cmd, "@ToDate", DbType.Date,
                Filter.ToDate.HasValue ? (object)Filter.ToDate.Value : DBNull.Value);

            db.AddInParameter(cmd, "@DN_No", DbType.String,
                string.IsNullOrEmpty(Filter.DN_No) ? (object)DBNull.Value : Filter.DN_No);

            db.AddInParameter(cmd, "@JW_SO_No", DbType.String,
                string.IsNullOrEmpty(Filter.JW_SO_No) ? (object)DBNull.Value : Filter.JW_SO_No);

            db.AddInParameter(cmd, "@JW_Customer_Number", DbType.Int64,
                Filter.JW_Customer_Number.HasValue ? (object)Filter.JW_Customer_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@PRS_Number", DbType.Int64,
                Filter.PRS_Number.HasValue ? (object)Filter.PRS_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@ItemGroup_Number", DbType.Int64,
                Filter.ItemGroup_Number.HasValue ? (object)Filter.ItemGroup_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@Item_Number", DbType.Int64,
                Filter.Item_Number.HasValue ? (object)Filter.Item_Number.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
    }
}
