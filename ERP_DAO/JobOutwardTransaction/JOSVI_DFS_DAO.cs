using System;
using System.Data;
using System.Data.Common;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using ERP_DTO.JobOutwardTransaction;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JOSVI_DFS_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet JO_JobworkInvoiceDFSDB(JO_JobworkInvoiceDFS_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOSVI_DFS_Save");

            Db.AddInParameter(DbC, "@JOSVI_DFS_MS_Number", DbType.Int64, DTO.JOSVI_DFS_MS_Number);
            Db.AddInParameter(DbC, "@JOSVI_DFS_JW_Vendor_Number", DbType.Int64, DTO.JOSVI_DFS_JW_Vendor_Number);
            Db.AddInParameter(DbC, "@JOSVI_DFS_PaymentTerms", DbType.String, DTO.JOSVI_DFS_PaymentTerms);
            Db.AddInParameter(DbC, "@JOSVI_DFS_PaymentMethod", DbType.String, DTO.JOSVI_DFS_PaymentMethod);
            Db.AddInParameter(DbC, "@JOSVI_DFS_Remarks", DbType.String, DTO.JOSVI_DFS_Remarks);

            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DataSet DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));
            return DS;
        }

        public DataSet JO_JobworkInvoiceDFSGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOSVI_DFS_Get");
            return Db.ExecuteDataSet(DbC);
        }
    }
}
