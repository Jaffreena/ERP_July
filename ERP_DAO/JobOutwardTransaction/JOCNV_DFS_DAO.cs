using System;
using System.Data;
using System.Data.Common;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using ERP_DTO.JobOutwardTransaction;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JOCNV_DFS_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet JO_ConversionDFSDB(JO_ConversionDFS_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOCNV_DFS_Save");

            Db.AddInParameter(DbC, "@JOCNV_DFS_MS_Number", DbType.Int64, DTO.JOCNV_DFS_MS_Number);
            Db.AddInParameter(DbC, "@JOCNV_DFS_JSFT_Number", DbType.Int64, DTO.JOCNV_DFS_JSFT_Number);
            Db.AddInParameter(DbC, "@JOCNV_DFS_JPRS_Number", DbType.Int64, DTO.JOCNV_DFS_JPRS_Number);
            Db.AddInParameter(DbC, "@JOCNV_DFS_JWWC_Number", DbType.Int64, DTO.JOCNV_DFS_JWWC_Number);

            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DataSet DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));
            return DS;
        }

        public DataSet JO_ConversionDFSGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOCNV_DFS_Get");
            return Db.ExecuteDataSet(DbC);
        }

        // Table0 = Shift, Table1 = Process, Table2 = Work Centre
        public DataSet JO_ConversionDFSDropdowns()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOCNV_DFS_Dropdowns");
            return Db.ExecuteDataSet(DbC);
        }
    }
}
