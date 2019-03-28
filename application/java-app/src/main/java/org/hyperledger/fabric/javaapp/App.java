/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package org.hyperledger.fabric.javaapp;

import java.io.InputStream;
import java.lang.reflect.Array;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.everit.json.schema.Schema;
import org.everit.json.schema.loader.SchemaLoader;
import org.everit.json.schema.ValidationException;
import org.json.JSONObject;
import org.json.JSONTokener;


public class App {

    public String getGreeting() {
        return "whatever";
    }
    
    class TestBean{
    	private String names[] = new String[] {};
    	public void setNames(String[] names) {
    		this.names=names;	
    	}
    	
    	public String[] getNames() {
    		return this.names;
    	}
    	
    	public String getOneString() {
    		return "hello world";
    	}
    	
    	public String toString() {
    		return Arrays.asList(this.names).toString();
    	}
    }

    public void go() throws Exception {
        System.out.println("Running own local testing....");
        try (InputStream inputStream = getClass().getResourceAsStream("schema.json")) {
            JSONObject rawSchema = new JSONObject(new JSONTokener(inputStream));

            SchemaLoader loader = SchemaLoader.builder().draftV7Support().schemaJson(rawSchema).build();
            Schema schema = loader.load().build();

            
            
//            Metadata md = new Metadata();
//            
//            Info i1 = new Info();
//            i1.setDescription("Info 1");
//            Info i2 = new Info();
//            i2.setDescription("Info 2");
//            
//            md.setInfo(i1);
//            md.setInfo(i2);
//
//            JSONObject joMetadata = new JSONObject(md);
//            // System.out.println(rawSchema.toString(2));
////            System.out.println(joMetadata.toString(2));
//            
//
//
//            
//            TestBean tb = new TestBean();
//            tb.setNames(new String[] {"alice","bob","charlie"});
//            System.out.println(tb);
//            JSONObject testJsonObject = new JSONObject(tb);
//            System.out.println(testJsonObject.toString());
//            
//            Map<String,Object> datamap = new HashMap<String,Object>();
//            datamap.put("keyone",new Info[] {i1,i2});
//            datamap.put("map",i1);
//            
//            JSONObject beta = new JSONObject(datamap);
//            System.out.println(beta.toString(2));
//            
//            
//            
//            
//            Class klass = tb.getClass();
//            Method[] methods = klass.getMethods();
//            for (final Method method: methods) {
//                final int modifiers = method.getModifiers();
//                String name = method.getName();
//                if (Modifier.isPublic(modifiers)
//                        && !Modifier.isStatic(modifiers)
//                        && method.getParameterTypes().length == 0
//                        && !method.isBridge()
//                        && method.getReturnType() != Void.TYPE)
////                        && isValidMethodName(method.getName())) {
//                	{
//                	
//                	 final Object result = method.invoke(tb);
//                	 System.out.println(Arrays.asList(result).toString());
//                	System.out.println(name + " Match" + result.getClass());
//                } else {
//                	System.out.println(name+ " No match");
//                }
//            }

        }
    }

    public static void main(String[] args) {
        try {
            new App().go();
        } catch (Throwable t) {
            System.out.println(t);
            t.printStackTrace();
        }

    }
}
