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
    public class JOFreightSOPendingDNRegister_DAO
    {
        DBConnect DB = new DBConnect();

        #region JO Freight SO Pending (DN) Register (Report 6.2)

        public DataSet JOFreightSOPendingDNRegisterDB(JOFreightSOPendingDNRegister_Filter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_FreightSOPendingDNRegister_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date,
                Filter.FromDate.HasValue ? (object)Filter.FromDate.Value : DBNull.Value);

            db.AddInParameter(cmd, "@ToDate", DbType.Date,
                Filter.ToDate.HasValue ? (object)Filter.ToDate.Value : DBNull.Value);

            db.AddInParameter(cmd, "@SO_No", DbType.String,
                string.IsNullOrEmpty(Filter.SO_No) ? (object)DBNull.Value : Filter.SO_No);

            db.AddInParameter(cmd, "@JW_Vendor_Number", DbType.Int64,
                Filter.JW_Vendor_Number.HasValue ? (object)Filter.JW_Vendor_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@JPRS_Number", DbType.Int64,
                Filter.JPRS_Number.HasValue ? (object)Filter.JPRS_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64,
                Filter.FromWH_Number.HasValue ? (object)Filter.FromWH_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64,
                Filter.ToWH_Number.HasValue ? (object)Filter.ToWH_Number.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
    }
}