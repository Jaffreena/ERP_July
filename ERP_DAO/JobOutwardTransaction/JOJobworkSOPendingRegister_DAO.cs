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
    public class JOJobworkSOPendingRegister_DAO
    {
        DBConnect DB = new DBConnect();

        #region JO Jobwork SO Pending Register (Report 6.1)

        public DataSet JOJobworkSOPendingRegisterDB(JOJobworkSOPendingRegister_Filter_DTO Filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JO_JobworkSOPendingRegister_SP");

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

            db.AddInParameter(cmd, "@ItemGroup_Number", DbType.Int64,
                Filter.ItemGroup_Number.HasValue ? (object)Filter.ItemGroup_Number.Value : DBNull.Value);

            db.AddInParameter(cmd, "@Item_Number", DbType.Int64,
                Filter.Item_Number.HasValue ? (object)Filter.Item_Number.Value : DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        #endregion
    }
}